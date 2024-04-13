create function towers_get(humanid bigint, towerid bigint)
		returns table (
			t_id         bigint,
			t_name       text,
			t_avatar_id  bigint,
			t_i_p	     boolean
		) as $$
		declare
			t_i_p	     boolean;
			t_id         bigint;
			t_name       text;
			t_avatar_id  bigint;
			m_id         bigint;
		begin
			select id, is_public, name, avatar_id into t_id, t_i_p, t_name, t_avatar_id from tower where id = towerid limit 1;
			if t_i_p = TRUE then				
				return query select t_id, t_name, t_avatar_id, t_i_p;
			else
				select id into m_id from member where human_id = humanid and tower_id = towerid;
				if not found then
					raise exception 'access to tower denied';
				else
					return query select t_id, t_name, t_avatar_id, t_i_p;
				end if;
  			end if;
		end $$
	    language plpgsql;