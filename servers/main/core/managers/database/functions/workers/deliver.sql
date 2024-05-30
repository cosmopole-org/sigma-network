create or replace function workers_deliver(userid bigint, usertype varchar(100), workerid bigint, spaceid bigint, topicid bigint, humanid bigint, uo text)
		returns table (
			allowed     boolean,
			mach_id     bigint,
			u_o         text
		) as $$
		declare
			m_id    	bigint;
			h_id 		bigint;
			allowed     boolean;
			mem_id      bigint;
			u_o         text;
		begin
			select machine_id, user_origin into m_id, u_o from worker where id = workerid and topic_id = topicid;
			if found then
				if usertype = 'human' then
					select id into mem_id from member where human_id = userid and space_id = spaceid and user_origin = uo;
					if mem_id > 0 then
						select TRUE, m_id into allowed, mach_id;
						return query select allowed, mach_id, u_o;
					else
						raise exception 'member not found';
					end if;
				else
					select user_origin into u_o from human where id = humanid;
					if m_id = userid then
						select TRUE, m_id into allowed, mach_id;
						return query select allowed, mach_id, u_o;
					else
						raise exception 'access denied';
					end if;
				end if;
			else
				raise exception 'worker not found';
			end if;
		    select FALSE, 0, '' into allowed, mach_id, u_o;
			return query select allowed, mach_id, u_o;
		end $$
	    language plpgsql;