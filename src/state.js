/**
 * Foydalanuvchi session holatlarini boshqarish moduli (In-Memory State Machine)
 */

export const BotStates = {
  IDLE: 'IDLE',
  AWAITING_KEY: 'AWAITING_KEY',
  AWAITING_PHOTO: 'AWAITING_PHOTO',
};

// Foydalanuvchi ID bo'yicha sessiyalarni saqlash xaritasi
const userSessions = new Map();

/**
 * Foydalanuvchi sessiyasini olish yoki yangisini yaratish
 * @param {number|string} userId
 * @returns {object}
 */
export function getSession(userId) {
  const id = String(userId);
  if (!userSessions.has(id)) {
    userSessions.set(id, {
      state: BotStates.IDLE,
      masterKey: null,
      updatedAt: Date.now(),
    });
  }
  return userSessions.get(id);
}

/**
 * Foydalanuvchi holatini (state) o'zgartirish
 * @param {number|string} userId
 * @param {string} state
 */
export function setUserState(userId, state) {
  const session = getSession(userId);
  session.state = state;
  session.updatedAt = Date.now();
  userSessions.set(String(userId), session);
}

/**
 * Foydalanuvchining to'g'ri javoblar kalitini saqlash
 * @param {number|string} userId
 * @param {Record<string, string>} masterKey
 */
export function setMasterKey(userId, masterKey) {
  const session = getSession(userId);
  session.masterKey = masterKey;
  session.state = BotStates.AWAITING_PHOTO;
  session.updatedAt = Date.now();
  userSessions.set(String(userId), session);
}

/**
 * Foydalanuvchi sessiyasini tozalash (bosh holatga qaytarish)
 * @param {number|string} userId
 */
export function clearSession(userId) {
  userSessions.delete(String(userId));
}
