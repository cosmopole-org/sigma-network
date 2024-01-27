create table session (
    id bigserial not null constraint session_pk primary key,
    user_id bigint not null,
    token varchar(100) not null,
    c_type int not null
);
