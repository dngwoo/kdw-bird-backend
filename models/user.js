// 파일 이름은 단수로!
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', { // MySQL에는 users 테이블 생성, 소문자 + 복수형으로 바뀜
        // id는 굳이 안만들어주어도 알아서 생성해서 넣어준다.
        email: {
            type: DataTypes.STRING(30), // 글자 수 제한, (STRING, TEXT, BOOLEAN, INTEGER, FLOAT, DATETIME) 많이 사용함.
            allowNull: false, // 필수,
            unique: true // 고유한 값
        },
        nickname: {
            type: DataTypes.STRING(30),
            allowNull: false // 필수
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: false // 필수
        },
    },{
        charset: 'utf8',
        collate: 'utf8_general_ci' // 한글 저장
    });
    User.associate = (db) => {}
    return User;
}