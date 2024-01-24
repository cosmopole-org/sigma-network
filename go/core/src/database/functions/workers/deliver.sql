create function workers_deliver(userid bigint, workerid bigint, roomid bigint)
		returns boolean as $$
		declare
			m_id         bigint;
		begin
			select machine_id into m_id from worker where id = workerid and room_id = roomid;
			if found then
				select id from human where id = userid limit 1;
				if found then
					select id from member where human_id = humanid and room_id = roomid;
					if found then
						return true;
					else
						raise exception 'member not found';
					end if;
				else
					select id from machine where id = userid limit 1;
					if found then
						if m_id = id then
							return true;
						else
							raise exception 'access denied';
						end if;
					else
						raise exception 'sender not found';
					end if;
				end if;
			else
				raise exception 'worker not found';
			end if;
			return false;
		end $$
	    language plpgsql;