create function invites_accept(humanid bigint, inviteid bigint)
		returns table (
			m_id 	     bigint,
		    m_human_id   bigint,
			m_tower_id 	 bigint
		) as $$
		declare
			m_id         bigint;
			h_id         bigint;
			t_id         bigint;
		begin
			select human_id, tower_id into h_id, t_id from invite where id = inviteid limit 1;
			if h_id = humanid then
				delete from invite where id = inviteid;
				insert into member
				(
					human_id,
					tower_id
				) values (h_id, t_id)
				returning id, human_id, tower_id into m_id, h_id, t_id;
				return query select m_id, h_id, t_id;
			else
				raise exception 'invite not found';
  			end if;
		end $$
	    language plpgsql;