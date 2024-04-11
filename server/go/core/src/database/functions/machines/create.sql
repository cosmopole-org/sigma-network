create or replace function machines_create(humanid bigint, tname varchar(100), tavatarid bigint, token varchar(100))
		returns table (
			m_id 	     bigint,
			s_id	     bigint
		) as $$
		declare
			m_id         bigint;
			s_id	     bigint;
		begin
			insert into machine
			(
				name,
				avatar_id,
				creator_id
			) values (tname, tavatarid, humanid)
			returning id into m_id;
			insert into session
			(
				user_id,
				token,
				c_type
			) values (m_id, token, 2)
			returning id into s_id;
			return query select m_id, s_id;
		end $$
	    language plpgsql;