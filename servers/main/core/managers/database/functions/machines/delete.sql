create function machines_delete(humanid bigint, machineid bigint)
		returns bigint as $$
		declare
			m_id         bigint;
			m_name       text;
			m_avatar_id  bigint;
			m_creator_id bigint;
			s_id         bigint;
			s_token      text;
		begin
			select id into m_id from machine where id = machineid and creator_id = humanid limit 1;
			if not found then				
				raise exception 'machine not found';
			else
				delete from machine where id = machineid;
				delete from session where user_id = machineid;
				return m_id;
			end if;
		end $$
	    language plpgsql;