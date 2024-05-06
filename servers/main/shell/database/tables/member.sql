create table member (
    id bigserial not null constraint member_pk primary key,
    human_id bigint not null,
    tower_id bigint not null,
    origin text not null,
    user_origin text not null
);