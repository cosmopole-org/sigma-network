create or replace function humans_create_gods(em text, firstname text, lastname text, tok text)
	returns table (
		h_id 	bigint,
		t 	    text
	) as $$
	declare
		h_id    bigint;
		t       text;
	begin
		select id into h_id from human where email = em;
		if not found then
			insert into human
			(
				email,
				first_name,
				last_name
			) values (em, firstname, lastname)
			returning id into h_id;
			insert into session
			(
				user_id,
				token,
				c_type
			) values (h_id, tok, 1);
			insert into admin
			(
				human_id,
				password
			) values (h_id, tok);
			return query select h_id, tok;
		else
			select session.token into t from session where user_id = h_id limit 1;
			return query select h_id, t;
		end if;
	end $$
	language plpgsql;