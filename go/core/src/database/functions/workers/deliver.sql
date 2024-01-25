create or replace function workers_deliver(userid bigint, workerid bigint, towerid bigint, roomid bigint)
		returns table (
			allowed   boolean,
			user_type text
		) as $$
		declare
			m_id    	bigint;
			h_id 		bigint;
			allowed     boolean;
			user_type   text;
			mem_id      bigint;
		begin
			select machine_id into m_id from worker where id = workerid and room_id = roomid;
			if found then
				select id into h_id from human where id = userid limit 1;
				if h_id > 0 then
					select id into mem_id from member where human_id = userid and tower_id = towerid;
					if mem_id > 0 then
						select TRUE, 'human' into allowed, user_type;
						return query select allowed, user_type;
					else
						raise exception 'member not found';
					end if;
				else
					if m_id = userid then
						select TRUE, 'machine' into allowed, user_type;
						return query select allowed, user_type;
					else
						raise exception 'access denied';
					end if;
				end if;
			else
				raise exception 'worker not found';
			end if;
		    select FALSE, 'dummy' into allowed, user_type;
			return query select allowed, user_type;
		end $$
	    language plpgsql;