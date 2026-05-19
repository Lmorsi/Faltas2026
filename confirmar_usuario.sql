-- Script para confirmar manualmente o email do usuário no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- Confirmar o usuário lucasmorsi2@gmail.com
UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email = 'lucasmorsi2@gmail.com';

-- Verificar se o usuário foi confirmado
SELECT id, email, email_confirmed_at, confirmed_at, created_at
FROM auth.users
WHERE email = 'lucasmorsi2@gmail.com';
