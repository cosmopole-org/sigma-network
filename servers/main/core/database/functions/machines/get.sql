create function machines_get(humanid bigint, machineid bigint)
		returns table (
			m_id         bigint,
			m_name       text,
			m_avatar_id  bigint,
			m_creator_id bigint,
			s_id	     bigint,
			s_token      text
		) as $$
		declare
			m_id         bigint;
			m_name       text;
			m_avatar_id  bigint;
			m_creator_id bigint;
			s_id         bigint;
			s_token      text;
		begin
			select id, name, avatar_id, creator_id into m_id, m_name, m_avatar_id, m_creator_id from machine where id = machineid limit 1;
			if not found then				
				raise exception 'machine not found';
			else
				select id, token into s_id, s_token from session where user_id = m_id limit 1;
				return query select m_id, m_name, m_avatar_id, m_creator_id, s_id, s_token;
			end if;
		end $$
	    language plpgsql;