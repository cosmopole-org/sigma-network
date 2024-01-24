create function workers_deliver(userid bigint, workerid bigint, roomid bigint)
		returns boolean as $$
		declare
			m_id    	bigint;
			human_id 	bigint;
		begin
			select machine_id into m_id from worker where id = workerid and room_id = roomid;
			if found then
				select id into human_id from human where id = userid limit 1;
				if human_id > 0 then
					return TRUE;
					select id from member where human_id = humanid and room_id = roomid;
					if found then
						return TRUE;
					else
						raise exception 'member not found';
					end if;
				else
					if m_id = userid then
						return TRUE;
					else
						raise exception 'access denied';
					end if;
				end if;
			else
				raise exception 'worker not found';
			end if;
			return FALSE;
		end $$
	    language plpgsql;