create function rooms_get(humanid bigint, towerid bigint, roomid bigint)
		returns table (
			r_id         bigint,
			r_name       text,
			r_avatar_id  bigint
		) as $$
		declare
			t_i_p	     boolean;
			r_id         bigint;
			r_name       text;
			r_avatar_id  bigint;
			m_id         bigint;
		begin
			select is_public into t_i_p from tower where id = towerid limit 1;
			if not found then
				raise exception 'tower not found';
			else
				if t_i_p = TRUE then
					select id, name, avatar_id into r_id, r_name, r_avatar_id from room where id = roomid and tower_id = towerid limit 1;
					if not found then
						raise exception 'room not found';
					else
						return query select r_id, r_name, r_avatar_id;
					end if;
				else
					select id into m_id from member where human_id = humanid and tower_id = towerid;
					if not found then
						raise exception 'access to tower denied';
					else
					    select id, name, avatar_id into r_id, r_name, r_avatar_id from room where id = roomid and tower_id = towerid limit 1;
						if not found then
							raise exception 'room not found';
						else
							return query select r_id, r_name, r_avatar_id;
						end if;
					end if;
  				end if;
			end if;
		end $$
	    language plpgsql;