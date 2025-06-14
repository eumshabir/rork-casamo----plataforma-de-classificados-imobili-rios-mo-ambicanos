import { router } from "./create-context";

// Auth routes
import { loginProcedure } from "./routes/auth/login/route";
import { registerProcedure } from "./routes/auth/register/route";
import { logoutProcedure } from "./routes/auth/logout/route";
import { meProcedure } from "./routes/auth/me/route";
import { verifyPhoneProcedure } from "./routes/auth/verify-phone/route";
import { requestVerificationCodeProcedure } from "./routes/auth/request-verification-code/route";
import { resetPasswordProcedure } from "./routes/auth/reset-password/route";
import { loginWithGoogleProcedure } from "./routes/auth/login-with-google/route";
import { loginWithFacebookProcedure } from "./routes/auth/login-with-facebook/route";

// User routes
import { getUsersProcedure } from "./routes/user/get-users/route";
import { getUserByIdProcedure } from "./routes/user/get-user-by-id/route";
import { updateProfileProcedure } from "./routes/user/update-profile/route";
import { upgradeToPremiumProcedure } from "./routes/user/upgrade-to-premium/route";
import { setPremiumProcedure } from "./routes/user/set-premium/route";

// Property routes
import { getPropertiesProcedure } from "./routes/property/get-properties/route";
import { getFeaturedPropertiesProcedure } from "./routes/property/get-featured-properties/route";
import { getUserPropertiesProcedure } from "./routes/property/get-user-properties/route";
import { getPropertyByIdProcedure } from "./routes/property/get-property-by-id/route";
import { createPropertyProcedure } from "./routes/property/create-property/route";
import { updatePropertyProcedure } from "./routes/property/update-property/route";
import { deletePropertyProcedure } from "./routes/property/delete-property/route";
import { getPropertyStatsProcedure } from "./routes/property/get-property-stats/route";
import { searchPropertiesProcedure } from "./routes/property/search-properties/route";

// Chat routes
import { getConversationsProcedure } from "./routes/chat/get-conversations/route";
import { getMessagesProcedure } from "./routes/chat/get-messages/route";
import { sendMessageProcedure } from "./routes/chat/send-message/route";
import { createConversationProcedure } from "./routes/chat/create-conversation/route";
import { markAsReadProcedure } from "./routes/chat/mark-as-read/route";
import { deleteConversationProcedure } from "./routes/chat/delete-conversation/route";

// Notification routes
import { getNotificationsProcedure } from "./routes/notification/get-notifications/route";
import { markNotificationAsReadProcedure } from "./routes/notification/mark-as-read/route";
import { markAllNotificationsAsReadProcedure } from "./routes/notification/mark-all-as-read/route";
import { deleteNotificationProcedure } from "./routes/notification/delete-notification/route";
import { getUnreadCountProcedure } from "./routes/notification/get-unread-count/route";
import { updateSettingsProcedure } from "./routes/notification/update-settings/route";
import { getSettingsProcedure } from "./routes/notification/get-settings/route";
import { registerDeviceProcedure } from "./routes/notification/register-device/route";

// Payment routes
import { processPaymentProcedure } from "./routes/payment/process-payment/route";
import { verifyPaymentProcedure } from "./routes/payment/verify-payment/route";
import { getPaymentHistoryProcedure } from "./routes/payment/get-payment-history/route";
import { getPremiumPlansProcedure } from "./routes/payment/get-premium-plans/route";
import { getBoostOptionsProcedure } from "./routes/payment/get-boost-options/route";
import { boostPropertyProcedure } from "./routes/payment/boost-property/route";

// Example route
import { hiProcedure } from "./routes/example/hi/route";

export const appRouter = router({
  example: router({
    hi: hiProcedure,
  }),
  
  auth: router({
    login: loginProcedure,
    register: registerProcedure,
    logout: logoutProcedure,
    me: meProcedure,
    verifyPhone: verifyPhoneProcedure,
    requestVerificationCode: requestVerificationCodeProcedure,
    resetPassword: resetPasswordProcedure,
    loginWithGoogle: loginWithGoogleProcedure,
    loginWithFacebook: loginWithFacebookProcedure,
  }),
  
  user: router({
    getUsers: getUsersProcedure,
    getUserById: getUserByIdProcedure,
    updateProfile: updateProfileProcedure,
    upgradeToPremium: upgradeToPremiumProcedure,
    setPremium: setPremiumProcedure,
  }),
  
  property: router({
    getProperties: getPropertiesProcedure,
    getFeaturedProperties: getFeaturedPropertiesProcedure,
    getUserProperties: getUserPropertiesProcedure,
    getPropertyById: getPropertyByIdProcedure,
    createProperty: createPropertyProcedure,
    updateProperty: updatePropertyProcedure,
    deleteProperty: deletePropertyProcedure,
    getPropertyStats: getPropertyStatsProcedure,
    searchProperties: searchPropertiesProcedure,
  }),
  
  chat: router({
    getConversations: getConversationsProcedure,
    getMessages: getMessagesProcedure,
    sendMessage: sendMessageProcedure,
    createConversation: createConversationProcedure,
    markAsRead: markAsReadProcedure,
    deleteConversation: deleteConversationProcedure,
  }),
  
  notification: router({
    getNotifications: getNotificationsProcedure,
    markAsRead: markNotificationAsReadProcedure,
    markAllAsRead: markAllNotificationsAsReadProcedure,
    deleteNotification: deleteNotificationProcedure,
    getUnreadCount: getUnreadCountProcedure,
    updateSettings: updateSettingsProcedure,
    getSettings: getSettingsProcedure,
    registerDevice: registerDeviceProcedure,
  }),
  
  payment: router({
    processPayment: processPaymentProcedure,
    verifyPayment: verifyPaymentProcedure,
    getPaymentHistory: getPaymentHistoryProcedure,
    getPremiumPlans: getPremiumPlansProcedure,
    getBoostOptions: getBoostOptionsProcedure,
    boostProperty: boostPropertyProcedure,
  }),
});

export type AppRouter = typeof appRouter;