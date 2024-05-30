create table space (
    id bigserial not null constraint space_pk primary key,
    name varchar(100) not null,
    avatar_id bigint,
    is_public boolean,
    creator_id bigint not null,
    origin text not null
);