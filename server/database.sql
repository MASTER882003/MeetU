drop database if exists db_meetu;
create database db_meetu;
use db_meetu;

create table `user` (
    id int primary key auto_increment,
    username varchar(255),
    `password` varchar(255),
    img varchar(255),
    token varchar(255)
);