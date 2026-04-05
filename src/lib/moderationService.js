import Report from "@/models/Report";
import Post from "@/models/Post";
import User from "@/models/User";

const BAD_WORDS = ["idiot", "stupid", "dumb", "ugly", "hate", "scam", "spam"]; // Configurable bad words list

/**
 * Moderation Engine - Evaluates post content and user activity to generate a risk score.
 */
export async function evaluatePostContent(userId, content, title = "") {
  let score = 0;
  const reasons = [];
  const fullText = `${title} ${content}`.toLowerCase();

  // LAYER 1: Basic String Parsing
  
  // 1a. Bad Words Check
  const containsBadWords = BAD_WORDS.some(word => fullText.includes(word));
  if (containsBadWords) {
    score += 3;
    reasons.push("Toxic/abusive language detected");
  }

  // 1b. Spam Patterns Check
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = fullText.match(urlRegex);
  if (urls && urls.length > 3) {
    score += 4;
    reasons.push("Excessive links (spam)");
  }

  // Check for repeated random characters (e.g. jjjjjjjjjjj, asdasdasdasd)
  const repeatedCharRegex = /(.)\1{9,}/; 
  if (repeatedCharRegex.test(fullText)) {
    score += 4;
    reasons.push("Spamming repeated characters");
  }

  // LAYER 2: Behavior-Based Detection

  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  
  // 2a. Rapid Posting Check
  const recentPosts = await Post.countDocuments({
    author: userId,
    createdAt: { $gte: tenMinutesAgo }
  });

  if (recentPosts >= 5) {
    score += 3;
    reasons.push("Rapid posting behavior limit reached");
  }

  // 2b. Duplicate Content Check
  const exactDuplicate = await Post.findOne({
    author: userId,
    content: content,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Dup within 24h
  });

  if (exactDuplicate) {
    score += 4;
    reasons.push("Duplicate content");
  }

  // 2c. Heavy Reports Trigger (If User has high existing risk score from previous flags)
  const user = await User.findById(userId).select("riskScore");
  if (user && user.riskScore >= 10) {
    score += 5;
    reasons.push("High historical risk score (Serial offender)");
  }

  // LAYER 3: Verdict Scoring System
  
  let severity = "low";
  if (score >= 8) severity = "high";
  else if (score >= 5) severity = "medium";

  return {
    flagged: score >= 5, // Medium or High triggers auto-flag
    score,
    severity,
    reason: reasons.join(", ") || "Clean",
  };
}

/**
 * Automates content moderation execution flow when a new Post is created.
 */
export async function autoModeratePost(userId, postId, content, title = "") {
  const evaluation = await evaluatePostContent(userId, content, title);

  if (evaluation.flagged) {
    // Determine post visibility status
    const postStatus = evaluation.severity === "high" ? "hidden" : "flagged";

    // Update Post
    await Post.findByIdAndUpdate(postId, {
      status: postStatus,
      autoFlagged: true,
    });

    // Generate Auto-Report
    await Report.create({
      reporter: userId, // Technically Auto, but we map to creator so it targets the creator's item logically, usually we'd have a system ID. But we're safe creating it like this.
      itemType: "Post",
      itemId: postId,
      reason: `AUTO-FLAGGED: ${evaluation.reason} (Score: ${evaluation.score})`,
      status: "pending",
      severity: evaluation.severity,
      isAuto: true,
    });

    // Update User Risk Score (+ severity rating equivalent)
    await User.findByIdAndUpdate(userId, {
      $inc: { riskScore: evaluation.score }
    });
  }

  return evaluation;
}
