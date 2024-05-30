create function topics_get(humanid bigint, spaceid bigint, topicid bigint)
		returns table (
			r_id         bigint,
			r_name       text,
			r_avatar_id  bigint,
			org          text
		) as $$
		declare
			t_i_p	     boolean;
			r_id         bigint;
			r_name       text;
			r_avatar_id  bigint;
			m_id         bigint;
			org          text;
		begin
			select is_public into t_i_p from space where id = spaceid limit 1;
			if not found then
				raise exception 'space not found';
			else
				if t_i_p = TRUE then
					select id, name, avatar_id, origin into r_id, r_name, r_avatar_id, org from topic where id = topicid and space_id = spaceid limit 1;
					if not found then
						raise exception 'topic not found';
					else
						return query select r_id, r_name, r_avatar_id, org;
					end if;
				else
					select id into m_id from member where human_id = humanid and space_id = spaceid;
					if not found then
						raise exception 'access to space denied';
					else
					    select id, name, avatar_id, origin into r_id, r_name, r_avatar_id, org from topic where id = topicid and space_id = spaceid limit 1;
						if not found then
							raise exception 'topic not found';
						else
							return query select r_id, r_name, r_avatar_id, org;
						end if;
					end if;
  				end if;
			end if;
		end $$
	    language plpgsql;