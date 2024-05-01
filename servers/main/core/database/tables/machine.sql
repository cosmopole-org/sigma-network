create table machine (
    id bigserial not null constraint macihne_pk primary key,
    name varchar(100) not null,
    avatar_id bigint,
    creator_id bigint not null,
    origin text not null
);