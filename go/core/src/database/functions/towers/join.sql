create or replace function towers_join(humanid bigint, towerid bigint)
		returns table (
			m_id 	     bigint,
		    m_human_id   bigint,
			m_tower_id 	 bigint
		) as $$
		declare
			i_p			 boolean;
			m_id         bigint;
			h_id         bigint;
			t_id         bigint;
		begin
			select is_public into i_p from tower where id = towerid limit 1;
			if i_p = TRUE then
				insert into member
				(
					human_id,
					tower_id
				) values (humanid, towerid)
				returning id, human_id, tower_id into m_id, h_id, t_id;
				return query select m_id, h_id, t_id;
			else
				raise exception 'public tower not found';
  			end if;
		end $$
	    language plpgsql;