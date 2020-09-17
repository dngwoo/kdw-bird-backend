// 파일 이름은 단수로!
module.exports = (sequelize, DataTypes) => {
    const Image = sequelize.define('Image', { // MySQL에는 Images 테이블 생성, 소문자 + 복수형으로 바뀜
        // id는 굳이 안만들어주어도 알아서 생성해서 넣어준다.
        src: {
            type: DataTypes.STRING(200), // 이미지는 url이라서 매우 길어질 수 있기 때문
            allowNull: false // 필수
        }
    },{
        charset: 'utf8',
        collate: 'utf8_general_ci' // 한글 저장
    });
    Image.associate = (db) => {
        db.Image.belongsTo(db.Post) // 이미지는 어떤 포스트에게 속해있다.
    }
    return Image;
}