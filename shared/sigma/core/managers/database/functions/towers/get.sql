create function spaces_get(humanid bigint, spaceid bigint)
		returns table (
			t_id         bigint,
			t_name       text,
			t_avatar_id  bigint,
			t_i_p	     boolean,
			org          text
		) as $$
		declare
			t_i_p	     boolean;
			t_id         bigint;
			t_name       text;
			t_avatar_id  bigint;
			m_id         bigint;
			org          text;
		begin
			select id, is_public, name, avatar_id, origin into t_id, t_i_p, t_name, t_avatar_id, org from space where id = spaceid limit 1;
			if t_i_p = TRUE then				
				return query select t_id, t_name, t_avatar_id, t_i_p, org;
			else
				select id into m_id from member where human_id = humanid and space_id = spaceid;
				if not found then
					raise exception 'access to space denied';
				else
					return query select t_id, t_name, t_avatar_id, t_i_p, org;
				end if;
  			end if;
		end $$
	    language plpgsql;