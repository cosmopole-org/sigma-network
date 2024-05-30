create table topic (
    id bigserial not null constraint topic_pk primary key,
    name varchar(100) not null,
    avatar_id bigint,
    space_id bigint not null,
    origin text not null
);