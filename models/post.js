const Sequelize = require('sequelize');

class Post extends Sequelize.Model {
  static initiate(sequelize) {
    Post.init({
      title: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      content: {
        type: Sequelize.STRING(140),
        allowNull: false,
      },
      img: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
    }, {
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: 'Post',
      tableName: 'posts',
      paranoid: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    });
  }

  static associate(db) {
    db.Post.belongsTo(db.User);
    db.Post.hasMany(db.Comment);
  }
}

module.exports = Post;

