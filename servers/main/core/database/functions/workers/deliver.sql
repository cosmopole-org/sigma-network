create or replace function workers_deliver(userid bigint, usertype varchar(100), workerid bigint, towerid bigint, roomid bigint)
		returns table (
			allowed     boolean,
			mach_id     bigint
		) as $$
		declare
			m_id    	bigint;
			h_id 		bigint;
			allowed     boolean;
			mem_id      bigint;
		begin
			select machine_id into m_id from worker where id = workerid and room_id = roomid;
			if found then
				if usertype = 'human' then
					select id into mem_id from member where human_id = userid and tower_id = towerid;
					if mem_id > 0 then
						select TRUE, m_id into allowed, mach_id;
						return query select allowed, mach_id;
					else
						raise exception 'member not found';
					end if;
				else
					if m_id = userid then
						select TRUE, m_id into allowed, mach_id;
						return query select allowed, mach_id;
					else
						raise exception 'access denied';
					end if;
				end if;
			else
				raise exception 'worker not found';
			end if;
		    select FALSE, 0 into allowed, mach_id;
			return query select allowed, mach_id;
		end $$
	    language plpgsql;