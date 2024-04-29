create or replace function humans_signin(em text, pass text)
	returns text as $$
	declare
		h_id bigint;
		a_id bigint;
		t    text;
	begin
		select id into h_id from human where email = em limit 1;
		if found then
			select id into a_id from admin where human_id = h_id and password = pass limit 1;
			if found then
				select session.token into t from session where user_id = h_id limit 1;
				if found then
					return t;
				else
					raise exception 'access denied';
				end if;
			else
				raise exception 'access denied';
			end if;
		else
			raise exception 'human not found';
		end if;
	end $$
	language plpgsql;