DO $$ 
DECLARE 
  i INTEGER;
BEGIN 
  FOR i IN 1..25 LOOP
    INSERT INTO "Patient" ("firstName", "lastName", "patientCode", "dob", "status", "updatedAt") 
    VALUES ('Prueba' || i, 'Apellido', 'TEST-' || i || '-' || random(), '1990-01-01', 'ACTIVE', NOW());
  END LOOP;
END $$;
