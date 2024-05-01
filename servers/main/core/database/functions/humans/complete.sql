create or replace function humans_complete(cc varchar(100), vc varchar(100), fname varchar(100), lname varchar(100), t varchar(100), org text)
		returns table (
			h_id 	     bigint,
		    h_email      text,
			h_first_name text,
			h_last_name  text,
			s_id         bigint,
			s_token 	 text
		) as $$
		declare
			res1   		 text;
			res2         text;
			h_id         bigint;
			h_email      text;
			h_first_name text;
			h_last_name  text;
			s_id         bigint;
			s_token      text;
		begin
			update pending set state = 'completed' where client_code = cc and verify_code = vc and state = 'verified'
			returning state, email into res1, res2;
			if res1 = 'completed' then
				insert into human
				(
					email,
					first_name,
					last_name,
					origin
				) values (res2, fname, lname, org)
				ON CONFLICT(email) do update set first_name = fname, last_name = lname
				returning id, email, first_name, last_name into h_id, h_email, h_first_name, h_last_name;
				insert into session
				(
					user_id,
					token,
					c_type
				) values (h_id, t, 1)
				returning id, token into s_id, s_token;
				return query select h_id, h_email, h_first_name, h_last_name, s_id, s_token;
			else
				raise exception 'pending not found';
  			end if;
		end $$
	    language plpgsql;