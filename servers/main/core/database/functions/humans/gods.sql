create or replace function humans_create_gods(em text, firstname text, lastname text, tok text)
	returns table (
		human_id 	bigint,
		t 	 		text
	) as $$
	declare
		human_id    bigint;
		t           text;
	begin
		select id into human_id from human where email = em;
		if not found then
			insert into human
			(
				email,
				first_name,
				last_name,
				password
			) values (em, firstname, lastname, tok)
			returning id into human_id;
			insert into session
			(
				user_id,
				token,
				c_type
			) values (human_id, tok, 1);
			return query select human_id, tok;
		else
			select session.token into t from session where user_id = human_id limit 1;
			return query select human_id, t;
		end if;
	end $$
	language plpgsql;