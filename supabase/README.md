# Supabase setup for Twitter-clone

1. Crea un proyecto en https://app.supabase.com
2. En Settings -> API copia `URL` y `anon public key` y añade las variables en `.env`:

```
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhb...
```

3. Ejecuta el SQL de `supabase/schema.sql` en el SQL Editor de Supabase o con `supabase` CLI:

```sh
# Requiere supabase cli
supabase db remote set <YOUR_DB_CONNECTION>
supabase db reset # (opcional; destruye datos)
supabase db push --file supabase/schema.sql
```

4. Habilita OAuth providers en Settings -> Auth -> Providers (ej. Google)
5. Configura la tabla `profiles` para sincronizar con `auth.users` si quieres: un trigger en SQL (opcional)

6. Ejemplo de trigger para crear un perfil cuando el usuario se registra:

```sql
create function public.handle_new_user() returns trigger as $$
begin
  insert into profiles (id, username, created_at)
  values (new.id, new.email, now());
  return new;
end;
$$ language plpgsql;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();
```

7. Ejecuta `npm install` y arranca la app:

```bash
npm install
npm run start
```

8. Con la app abierta prueba el flujo de autenticar y publicar.

Notas
- `supabase-js` v2 tiene nuevos métodos `auth.signInWithOAuth()` y `auth.signInWithOtp()`.
- Para mejorar UX: agregar gestión de errores, validaciones y estilos.
