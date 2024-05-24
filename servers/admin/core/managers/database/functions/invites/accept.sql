create function invites_accept(humanid bigint, inviteid bigint, org text)
		returns table (
			m_id 	     bigint,
		    m_human_id   bigint,
			m_tower_id 	 bigint,
			u_o          text
		) as $$
		declare
			m_id         bigint;
			h_id         bigint;
			t_id         bigint;
			u_o          text;
		begin
			select human_id, tower_id, user_origin into h_id, t_id, u_o from invite where id = inviteid limit 1;
			if h_id = humanid then
				delete from invite where id = inviteid;
				insert into member
				(
					human_id,
					tower_id,
					origin,
    				user_origin
				) values (h_id, t_id, org, u_o)
				returning id, human_id, tower_id into m_id, h_id, t_id;
				return query select m_id, h_id, t_id, u_o;
			else
				raise exception 'invite not found';
  			end if;
		end $$
	    language plpgsql;