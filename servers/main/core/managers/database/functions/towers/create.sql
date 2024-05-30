create or replace function spaces_create(humanid bigint, tname varchar(100), tavatarid bigint, ispublic boolean, org text)
		returns table (
			m_id 	     bigint,
			t_id	     bigint
		) as $$
		declare
			t_id	     bigint;
			m_id         bigint;
		begin
			insert into space
			(
				name,
				avatar_id,
				is_public,
				creator_id,
				origin
			) values (tname, tavatarid, ispublic, humanid, org)
			returning id into t_id;
			insert into member
			(
				human_id,
				space_id,
				origin,
				user_origin
			) values (humanid, t_id, org, org)
			returning id into m_id;
			return query select m_id, t_id;
		end $$
	    language plpgsql;