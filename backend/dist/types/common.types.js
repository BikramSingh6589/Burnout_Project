export var AuthProvider;
(function (AuthProvider) {
    AuthProvider["Local"] = "local";
    AuthProvider["Google"] = "google";
})(AuthProvider || (AuthProvider = {}));
export var Gender;
(function (Gender) {
    Gender["Male"] = "male";
    Gender["Female"] = "female";
    Gender["NonBinary"] = "non_binary";
    Gender["PreferNotToSay"] = "prefer_not_to_say";
    Gender["Other"] = "other";
})(Gender || (Gender = {}));
export var AccountStatus;
(function (AccountStatus) {
    AccountStatus["Active"] = "active";
    AccountStatus["Inactive"] = "inactive";
    AccountStatus["Suspended"] = "suspended";
    AccountStatus["PendingVerification"] = "pending_verification";
})(AccountStatus || (AccountStatus = {}));
export var RiskLevel;
(function (RiskLevel) {
    RiskLevel["Low"] = "low";
    RiskLevel["Moderate"] = "moderate";
    RiskLevel["High"] = "high";
    RiskLevel["Critical"] = "critical";
})(RiskLevel || (RiskLevel = {}));
export var AssessmentStatus;
(function (AssessmentStatus) {
    AssessmentStatus["Draft"] = "draft";
    AssessmentStatus["Completed"] = "completed";
    AssessmentStatus["Reviewed"] = "reviewed";
})(AssessmentStatus || (AssessmentStatus = {}));
export var Mood;
(function (Mood) {
    Mood["VeryLow"] = "very_low";
    Mood["Low"] = "low";
    Mood["Neutral"] = "neutral";
    Mood["Good"] = "good";
    Mood["Excellent"] = "excellent";
})(Mood || (Mood = {}));
export var ConversationRole;
(function (ConversationRole) {
    ConversationRole["Student"] = "student";
    ConversationRole["Assistant"] = "assistant";
    ConversationRole["System"] = "system";
})(ConversationRole || (ConversationRole = {}));
export var RecommendationCategory;
(function (RecommendationCategory) {
    RecommendationCategory["Sleep"] = "sleep";
    RecommendationCategory["StudyHabits"] = "study_habits";
    RecommendationCategory["Mindfulness"] = "mindfulness";
    RecommendationCategory["Counseling"] = "counseling";
    RecommendationCategory["Exercise"] = "exercise";
    RecommendationCategory["SocialSupport"] = "social_support";
    RecommendationCategory["TimeManagement"] = "time_management";
    RecommendationCategory["CrisisSupport"] = "crisis_support";
})(RecommendationCategory || (RecommendationCategory = {}));
export var RecommendationPriority;
(function (RecommendationPriority) {
    RecommendationPriority["Low"] = "low";
    RecommendationPriority["Medium"] = "medium";
    RecommendationPriority["High"] = "high";
    RecommendationPriority["Urgent"] = "urgent";
})(RecommendationPriority || (RecommendationPriority = {}));
export var RecommendationStatus;
(function (RecommendationStatus) {
    RecommendationStatus["Assigned"] = "assigned";
    RecommendationStatus["InProgress"] = "in_progress";
    RecommendationStatus["Completed"] = "completed";
    RecommendationStatus["Dismissed"] = "dismissed";
})(RecommendationStatus || (RecommendationStatus = {}));
export var NotificationType;
(function (NotificationType) {
    NotificationType["AssessmentReminder"] = "assessment_reminder";
    NotificationType["RiskAlert"] = "risk_alert";
    NotificationType["Recommendation"] = "recommendation";
    NotificationType["System"] = "system";
})(NotificationType || (NotificationType = {}));
export var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["Email"] = "email";
    NotificationChannel["Sms"] = "sms";
    NotificationChannel["Push"] = "push";
    NotificationChannel["InApp"] = "in_app";
})(NotificationChannel || (NotificationChannel = {}));
export var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["Pending"] = "pending";
    NotificationStatus["Sent"] = "sent";
    NotificationStatus["Read"] = "read";
    NotificationStatus["Failed"] = "failed";
})(NotificationStatus || (NotificationStatus = {}));
export var AdminRole;
(function (AdminRole) {
    AdminRole["SuperAdmin"] = "super_admin";
    AdminRole["Counselor"] = "counselor";
    AdminRole["Faculty"] = "faculty";
    AdminRole["Analyst"] = "analyst";
})(AdminRole || (AdminRole = {}));
//# sourceMappingURL=common.types.js.map