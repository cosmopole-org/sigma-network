create or replace function spaces_join(humanid bigint, spaceid bigint, org text, uo text)
		returns table (
			m_id 	     bigint,
		    m_human_id   bigint,
			m_space_id 	 bigint
		) as $$
		declare
			i_p			 boolean;
			m_id         bigint;
			h_id         bigint;
			t_id         bigint;
		begin
			select is_public into i_p from space where id = spaceid limit 1;
			if i_p = TRUE then
				insert into member
				(
					human_id,
					space_id,
					origin,
    				user_origin
				) values (humanid, spaceid, org, uo)
				returning id, human_id, space_id into m_id, h_id, t_id;
				return query select m_id, h_id, t_id;
			else
				raise exception 'public space not found';
  			end if;
		end $$
	    language plpgsql;