create function humans_verify(cc varchar(100), vc varchar(100))
	returns RECORD as $$
	declare
		p_id   		 bigint;
		p_email      text;
		p_cc         text;
		p_vc         text;
		p_state      text;
		h_id         bigint;
		h_email      text;
		h_first_name text;
		h_last_name  text;
		s_id         bigint;
		s_token      text;
		ret RECORD;
	begin
		update pending set state = 'verified' where client_code = cc and verify_code = vc and state = 'created'
		returning id, cc, vc, state, email into p_id, p_cc, p_vc, p_state, p_email;
		if p_state = 'verified' then
			select id, email, first_name, last_name into h_id, h_email, h_first_name, h_last_name from human where email = p_email limit 1;
			select id, token into s_id, s_token from session where user_id = h_id limit 1;
			if found then
				update pending set state = 'completed' where client_code = cc and verify_code = vc
				returning state into p_state;
			end if;	
			select p_id, p_cc, p_vc, p_state, p_email, h_id, h_email, h_first_name, h_last_name, s_id, s_token into ret;
		else
			raise exception 'pending not found';
		end if;
		return ret;
	end $$
	language plpgsql;