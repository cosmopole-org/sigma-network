create table invite (
    id bigserial not null constraint invite_pk primary key,
    human_id bigint not null,
    space_id bigint not null,
    origin text not null,
    user_origin text not null,
    unique (human_id, space_id, user_origin)
);