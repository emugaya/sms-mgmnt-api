module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
      firstName: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
            len: {
              args: [3],
              msg: 'Firstname must have a minimum of 3 characters'
            }
          }
      },
      lastName: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
            len: {
              args: [3],
              msg: 'Lastname must have a minimum of 3 characters'
            }
          }
      },
      telephoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'unique_user_telephoneNumber',
        validate: {
          notEmpty: true,
          len: {
            args: [9],
            msg: 'Number must be supplied'
          }
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'unique_user_email',
        validate: {
          isEmail: {
            msg: 'Email must be valid'
          },
          notEmpty: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          is: {
            args: [new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})")],
            msg: 'Password must have uppercase, lowercase, numbers, special characters and atleast 8 characters long.'
          }
        }
      },
      token: DataTypes.INTEGER,
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      resetPasswordToken: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      resetPassowrdExpires: {
        type: DataTypes.DATE,
        allownull: true
      },
      createdBy: DataTypes.INTEGER,
      updateBy: DataTypes.INTEGER
  }, {
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['resetPasswordToken']
      },
      {
        unique: true,
        fields: ['email', 'telephoneNumber']
      }
    ],
    // classMethods: {
    //   addScopes: function(models) {
    //     User.addScope('profile',
    //     {
    //       'attributes' : ['id', 'firstName', 'lastName', 'email', 'active']
    //     });
    //     User.addScope('auth', 
    //     {
    //       'attributes': ['id', 'firstName', 'lastName', 'email'],
    //       'where': { 'active': true }
    //     });
    //   }
    // },
    defaultScope: {
      'attributes': ['id', 'firstName', 'lastName', 'email', 'active']
    },
    scopes: {
      auth: { 
        attributes: ['id', 'firstName', 'lastName','telephoneNumber', 'email', 'active', 'token'],
        where: {
          active: true
        }
      },
      login: {
        attributes: ['id', 'firstName', 'lastName', 'email', 'password', 'active', 'token'],
        where: {
          active: true
        }
      },
      logout: {
        attributes: ['id', 'firstName', 'lastName', 'email', 'active']
      },
      deleted: {
        paranoid: false,
        where: {
          deletedAt: {$ne: null}
        }
      },
      reset: {
        attributes: ['id', 'resetPasswordToken', 'resetPasswordExpires', 'email'],
        where: {
          active: true
        }
      },
      resetPasswordEmail: {
        attributes: ['id', 'name', 'email'],
        where: {
          active: true
        }
      }
    }
  });

  return User;
}
