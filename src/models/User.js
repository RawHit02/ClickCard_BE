const pool = require('../config/database');

const createUserTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone_number VARCHAR(20) UNIQUE,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      date_of_birth DATE,
      gender VARCHAR(20),
      profile_picture VARCHAR(500),
      fcm_token VARCHAR(500),
      is_email_verified BOOLEAN DEFAULT FALSE,
      is_profile_complete BOOLEAN DEFAULT FALSE,
      public_profile_enabled BOOLEAN DEFAULT FALSE,
      profile_bio VARCHAR(500),
      profile_header_image VARCHAR(500),
      last_login TIMESTAMP,
      auth_provider VARCHAR(50) DEFAULT 'email',
      google_id VARCHAR(255) UNIQUE,
      apple_id VARCHAR(255) UNIQUE,
      device_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS email_otps (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      otp_code VARCHAR(10) NOT NULL,
      purpose VARCHAR(50), -- 'email_verification', 'password_reset'
      is_verified BOOLEAN DEFAULT FALSE,
      attempts INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP,
      verified_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(500) NOT NULL,
      is_revoked BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      personal_identity JSONB DEFAULT '{}',
      contact_information JSONB DEFAULT '{}',
      education JSONB DEFAULT '[]',
      work_experience JSONB DEFAULT '[]',
      business_details JSONB DEFAULT '{}',
      products_services JSONB DEFAULT '[]',
      social_links JSONB DEFAULT '{}',
      digital_card JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS share_links (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      custom_slug VARCHAR(50) UNIQUE,
      short_code VARCHAR(8) UNIQUE NOT NULL,
      is_password_protected BOOLEAN DEFAULT FALSE,
      share_password VARCHAR(255),
      is_active BOOLEAN DEFAULT TRUE,
      expiry_date TIMESTAMP,
      requires_qr_scan BOOLEAN DEFAULT FALSE,
      allowed_domains JSONB DEFAULT '[]',
      view_count INT DEFAULT 0,
      unique_visitors INT DEFAULT 0,
      last_viewed TIMESTAMP,
      share_method VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS share_link_analytics (
      id SERIAL PRIMARY KEY,
      share_link_id INT NOT NULL REFERENCES share_links(id) ON DELETE CASCADE,
      visitor_ip VARCHAR(50),
      visitor_user_agent VARCHAR(500),
      referrer_source VARCHAR(255),
      device_type VARCHAR(50),
      platform VARCHAR(50),
      viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_email_otps_email ON email_otps(email);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
    CREATE INDEX IF NOT EXISTS idx_users_apple_id ON users(apple_id);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_share_links_user_id ON share_links(user_id);
    CREATE INDEX IF NOT EXISTS idx_share_links_slug ON share_links(custom_slug);
    CREATE INDEX IF NOT EXISTS idx_share_links_short_code ON share_links(short_code);
    CREATE INDEX IF NOT EXISTS idx_analytics_share_link_id ON share_link_analytics(share_link_id);
  `;

  try {
    await pool.query(query);
    console.log('Tables created or already exist');
  } catch (err) {
    console.error('Error creating tables:', err);
  }
};

const User = {
  // Create a new user with full registration details
  create: async (email, hashedPassword, name = '', phone = '', fcmToken = '') => {
    const query = `
      INSERT INTO users (email, password, first_name, phone_number, fcm_token)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, phone_number, is_email_verified, is_profile_complete, created_at
    `;
    try {
      const result = await pool.query(query, [email, hashedPassword, name, phone, fcmToken]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Find user by email
  findByEmail: async (email) => {
    const query = `
      SELECT id, email, password, is_email_verified, is_profile_complete, first_name, last_name, phone_number
      FROM users
      WHERE email = $1
    `;
    try {
      const result = await pool.query(query, [email]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Find user by phone number
  findByPhone: async (phone) => {
    const query = `
      SELECT id, email, phone_number
      FROM users
      WHERE phone_number = $1
    `;
    try {
      const result = await pool.query(query, [phone]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Find user by ID
  findById: async (userId) => {
    const query = `
      SELECT id, email, first_name, last_name, phone_number, date_of_birth, 
             gender, profile_picture, is_email_verified, is_profile_complete, 
             last_login, created_at, updated_at
      FROM users
      WHERE id = $1
    `;
    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Update user profile (Legacy/Simple)
  updateProfile: async (userId, profileData) => {
    const { firstName, lastName, phoneNumber, dateOfBirth, gender } = profileData;
    const query = `
      UPDATE users
      SET first_name = $1, last_name = $2, phone_number = $3, 
          date_of_birth = $4, gender = $5, is_profile_complete = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING id, email, first_name, last_name, phone_number, date_of_birth, gender, is_profile_complete
    `;
    try {
      const result = await pool.query(query, [
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth,
        gender,
        userId,
      ]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Full Profile Management
  createOrUpdateProfile: async (userId, profileData) => {
    const {
      personalIdentity,
      contactInformation,
      education,
      workExperience,
      businessDetails,
      productsServices,
      socialLinks,
      digitalCard,
    } = profileData;

    const query = `
      INSERT INTO user_profiles (
        user_id, personal_identity, contact_information, education, 
        work_experience, business_details, products_services, social_links, digital_card
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (user_id) DO UPDATE SET
        personal_identity = EXCLUDED.personal_identity,
        contact_information = EXCLUDED.contact_information,
        education = EXCLUDED.education,
        work_experience = EXCLUDED.work_experience,
        business_details = EXCLUDED.business_details,
        products_services = EXCLUDED.products_services,
        social_links = EXCLUDED.social_links,
        digital_card = EXCLUDED.digital_card,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    try {
      // Begin transaction
      await pool.query('BEGIN');

      const result = await pool.query(query, [
        userId,
        JSON.stringify(personalIdentity || {}),
        JSON.stringify(contactInformation || {}),
        JSON.stringify(education || []),
        JSON.stringify(workExperience || []),
        JSON.stringify(businessDetails || {}),
        JSON.stringify(productsServices || []),
        JSON.stringify(socialLinks || {}),
        JSON.stringify(digitalCard || {}),
      ]);

      // Update users table to mark profile as complete
      await pool.query(
        'UPDATE users SET is_profile_complete = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [userId]
      );

      await pool.query('COMMIT');
      return result.rows[0];
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }
  },

  // Get full profile
  getProfile: async (userId) => {
    const query = `
      SELECT p.*, u.email, u.first_name, u.last_name, u.phone_number, u.is_email_verified, u.is_profile_complete
      FROM user_profiles p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1
    `;
    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Verify email
  verifyEmail: async (userId) => {
    const query = `
      UPDATE users
      SET is_email_verified = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, email, is_email_verified
    `;
    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Update password
  updatePassword: async (userId, newHashedPassword) => {
    const query = `
      UPDATE users
      SET password = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, email
    `;
    try {
      const result = await pool.query(query, [newHashedPassword, userId]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Update last login
  updateLastLogin: async (userId) => {
    const query = `
      UPDATE users
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    try {
      await pool.query(query, [userId]);
    } catch (err) {
      throw err;
    }
  },

  // Update FCM token
  updateFcmToken: async (userId, fcmToken) => {
    const query = `
      UPDATE users
      SET fcm_token = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, fcm_token
    `;
    try {
      const result = await pool.query(query, [fcmToken, userId]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Find user by Google ID
  findByGoogleId: async (googleId) => {
    const query = `
      SELECT id, email, first_name, last_name, phone_number, google_id, apple_id, 
             auth_provider, is_email_verified, is_profile_complete, fcm_token, device_id
      FROM users
      WHERE google_id = $1
    `;
    try {
      const result = await pool.query(query, [googleId]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Find user by Apple ID
  findByAppleId: async (appleId) => {
    const query = `
      SELECT id, email, first_name, last_name, phone_number, google_id, apple_id,
             auth_provider, is_email_verified, is_profile_complete, fcm_token, device_id
      FROM users
      WHERE apple_id = $1
    `;
    try {
      const result = await pool.query(query, [appleId]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Create user via social auth
  createSocialUser: async (email, authType, socialId, name = '', phone = '', fcmToken = '', deviceId = '') => {
    const socialIdField = authType === 'google' ? 'google_id' : 'apple_id';
    const randomPassword = require('crypto').randomBytes(32).toString('hex');
    
    const query = `
      INSERT INTO users (email, password, first_name, phone_number, fcm_token, 
                         auth_provider, ${socialIdField}, device_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, email, first_name, last_name, phone_number, is_email_verified, 
                is_profile_complete, auth_provider, fcm_token, device_id, created_at
    `;
    try {
      const result = await pool.query(query, [email, randomPassword, name, phone, fcmToken, authType, socialId, deviceId]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Update user social ID
  updateSocialId: async (userId, authType, socialId) => {
    const socialIdField = authType === 'google' ? 'google_id' : 'apple_id';
    const query = `
      UPDATE users
      SET ${socialIdField} = $1, auth_provider = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, email, first_name, auth_provider, google_id, apple_id
    `;
    try {
      const result = await pool.query(query, [socialId, authType, userId]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Update user device and fcm info
  updateDeviceInfo: async (userId, deviceId, fcmToken) => {
    const query = `
      UPDATE users
      SET device_id = $1, fcm_token = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, device_id, fcm_token
    `;
    try {
      const result = await pool.query(query, [deviceId, fcmToken, userId]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },
};

module.exports = { User, createUserTable };

