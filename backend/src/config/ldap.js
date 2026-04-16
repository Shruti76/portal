const ldapjs = require('ldapjs');

/**
 * LDAP/Active Directory Configuration
 * Configure these environment variables in your .env file:
 * - LDAP_URL: ldap://your-ad-server:389
 * - LDAP_BIND_DN: CN=service-account,CN=Users,DC=yourcompany,DC=com
 * - LDAP_BIND_PASSWORD: service-account-password
 * - LDAP_BASE_DN: DC=yourcompany,DC=com
 * - LDAP_USER_SEARCH_FILTER: (sAMAccountName={{username}})
 * - LDAP_GROUP_SEARCH_FILTER: (member={{dn}})
 */

const ldapConfig = {
  url: process.env.LDAP_URL || 'ldap://localhost:389',
  bindDN: process.env.LDAP_BIND_DN || '',
  bindPassword: process.env.LDAP_BIND_PASSWORD || '',
  baseDN: process.env.LDAP_BASE_DN || 'DC=example,DC=com',
  userSearchFilter: process.env.LDAP_USER_SEARCH_FILTER || '(sAMAccountName={{username}})',
  groupSearchFilter: process.env.LDAP_GROUP_SEARCH_FILTER || '(member={{dn}})',
  attributes: ['mail', 'displayName', 'sAMAccountName', 'memberOf', 'department', 'telephoneNumber'],
};

/**
 * Create LDAP client and bind with service account
 */
const createLDAPClient = () => {
  return new Promise((resolve, reject) => {
    const client = ldapjs.createClient({
      url: ldapConfig.url,
      reconnect: true,
      timeout: 10000,
    });

    client.on('error', (err) => {
      reject(new Error(`LDAP Connection Error: ${err.message}`));
    });

    if (ldapConfig.bindDN && ldapConfig.bindPassword) {
      client.bind(ldapConfig.bindDN, ldapConfig.bindPassword, (err) => {
        if (err) {
          reject(new Error(`LDAP Bind Error: ${err.message}`));
        } else {
          resolve(client);
        }
      });
    } else {
      resolve(client);
    }
  });
};

/**
 * Authenticate user with Active Directory
 * @param {string} username - Username (sAMAccountName)
 * @param {string} password - Password
 * @returns {Promise<object>} User object from AD
 */
const authenticateUser = async (username, password) => {
  let client;
  try {
    client = await createLDAPClient();

    // Search for the user
    const searchFilter = ldapConfig.userSearchFilter.replace('{{username}}', username);
    
    return new Promise((resolve, reject) => {
      client.search(ldapConfig.baseDN, { filter: searchFilter, attributes: ldapConfig.attributes }, (err, res) => {
        if (err) {
          return reject(new Error(`User search failed: ${err.message}`));
        }

        let userEntry = null;
        let userDN = null;

        res.on('searchEntry', (entry) => {
          userEntry = entry.object;
          userDN = entry.dn;
        });

        res.on('error', (err) => {
          reject(new Error(`Search error: ${err.message}`));
        });

        res.on('end', () => {
          if (!userEntry) {
            return reject(new Error('User not found'));
          }

          // Attempt to bind with user credentials
          const userClient = ldapjs.createClient({
            url: ldapConfig.url,
            reconnect: true,
            timeout: 10000,
          });

          userClient.bind(userDN, password, (err) => {
            if (err) {
              return reject(new Error('Invalid credentials'));
            }

            // Get user groups
            getGroupMembership(client, userDN)
              .then((groups) => {
                userEntry.groups = groups;
                userEntry.dn = userDN;
                resolve(userEntry);
              })
              .catch((groupErr) => {
                // Continue even if group retrieval fails
                console.warn('Failed to retrieve groups:', groupErr);
                userEntry.groups = [];
                userEntry.dn = userDN;
                resolve(userEntry);
              })
              .finally(() => {
                userClient.unbind();
              });
          });
        });
      });
    });
  } finally {
    if (client) {
      client.unbind();
    }
  }
};

/**
 * Get user's group memberships
 * @param {object} client - LDAP client
 * @param {string} userDN - User's distinguished name
 * @returns {Promise<array>} Array of group names
 */
const getGroupMembership = (client, userDN) => {
  return new Promise((resolve, reject) => {
    const groupFilter = ldapConfig.groupSearchFilter.replace('{{dn}}', userDN);
    
    client.search(ldapConfig.baseDN, { filter: groupFilter, attributes: ['cn'] }, (err, res) => {
      if (err) {
        return reject(err);
      }

      const groups = [];
      res.on('searchEntry', (entry) => {
        groups.push(entry.object.cn);
      });

      res.on('error', reject);
      res.on('end', () => resolve(groups));
    });
  });
};

/**
 * Verify user exists in Active Directory
 * @param {string} username - Username to verify
 * @returns {Promise<boolean>} True if user exists
 */
const userExists = async (username) => {
  let client;
  try {
    client = await createLDAPClient();
    const searchFilter = ldapConfig.userSearchFilter.replace('{{username}}', username);
    
    return new Promise((resolve, reject) => {
      client.search(ldapConfig.baseDN, { filter: searchFilter }, (err, res) => {
        if (err) return reject(err);

        let found = false;
        res.on('searchEntry', () => {
          found = true;
        });

        res.on('error', reject);
        res.on('end', () => resolve(found));
      });
    });
  } finally {
    if (client) {
      client.unbind();
    }
  }
};

module.exports = {
  authenticateUser,
  userExists,
  getGroupMembership,
  ldapConfig,
};
