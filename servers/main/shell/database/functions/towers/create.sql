create function towers_create(humanid bigint, tname varchar(100), tavatarid bigint, ispublic boolean, org text)
		returns table (
			m_id 	     bigint,
			t_id	     bigint
		) as $$
		declare
			t_id	     bigint;
			m_id         bigint;
		begin
			insert into tower
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
				tower_id,
				origin
			) values (humanid, t_id, org)
			returning id into m_id;
			return query select m_id, t_id;
		end $$
	    language plpgsql;