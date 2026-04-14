# Database Schema

## Cómo aplicar el schema

1. Ve a tu proyecto en Supabase Dashboard
2. Abre el SQL Editor
3. Copia y pega el contenido de `schema.sql`
4. Ejecuta el script

## Estructura de la Base de Datos

### 📊 Tablas Principales

#### `income_sources` - Fuentes de Ingreso
Almacena las fuentes de ingreso del usuario (salario, freelance, etc.)

**Campos importantes:**
- `amount`: Monto del ingreso
- `frequency_type`: Tipo de frecuencia (weekly, biweekly, monthly, etc.)
- `frequency_config`: Configuración JSON para frecuencias personalizadas
- `next_payment_date`: Próxima fecha de pago (calculada automáticamente)

**Ejemplos de configuración:**

```javascript
// Quincenal (cada 15 días)
{
  frequency_type: 'biweekly',
  frequency_config: {}
}

// Cada 14 días
{
  frequency_type: 'custom_days',
  frequency_config: { days: 14 }
}

// Cada 2 jueves
{
  frequency_type: 'custom_weekday',
  frequency_config: { weeks: 2, weekday: 4 } // 4 = jueves
}

// Mensual
{
  frequency_type: 'monthly',
  frequency_config: { day: 1 } // día del mes
}
```

#### `income_transactions` - Transacciones de Ingreso
Registra los ingresos reales recibidos

#### `fixed_expenses` - Gastos Fijos Recurrentes
Gastos que se cobran en un día específico del mes (renta, suscripciones, etc.)

**Campos importantes:**
- `charge_day`: Día del mes (1-31) cuando se cobra
- `is_active`: Si está activo o no

**Ejemplo:**
```sql
-- Renta que se cobra el día 1 de cada mes
insert into fixed_expenses (user_id, description, amount, charge_day)
values (auth.uid(), 'Renta', 1500.00, 1);

-- Netflix que se cobra el día 25
insert into fixed_expenses (user_id, description, amount, charge_day)
values (auth.uid(), 'Netflix', 15.99, 25);
```

#### `variable_expenses` - Gastos Variables
Gastos del día a día que se descuentan del presupuesto variable

#### `budget_periods` - Períodos de Presupuesto
Cada período tiene un presupuesto variable que se arrastra entre períodos

**Campos importantes:**
- `initial_budget`: Presupuesto definido por el usuario para este período
- `carried_over`: Monto arrastrado del período anterior (puede ser + o -)
- `total_budget`: Suma automática de initial_budget + carried_over
- `spent`: Total gastado en gastos variables
- `remaining`: Lo que queda (puede ser negativo)

**Flujo:**
1. Usuario recibe salario → Se crea nuevo período
2. Usuario define presupuesto variable (ej: $500)
3. Si el período anterior sobró $50 → total_budget = $550
4. Si el período anterior faltó $30 → total_budget = $470
5. Al cerrar período, el `remaining` se pasa como `carried_over` al siguiente

#### `user_settings` - Configuración del Usuario
Configuración global del sistema de presupuesto

#### `expense_categories` - Categorías de Gastos
Categorías personalizables para organizar gastos

### 🔒 Seguridad (RLS)

Todas las tablas tienen Row Level Security habilitado:
- Los usuarios solo pueden ver/editar sus propios datos
- Automático con `auth.uid()`

### ⚡ Funciones Automáticas

1. **`calculate_next_payment_date()`**: Calcula la próxima fecha de pago
2. **Triggers**: Actualizan automáticamente `next_payment_date` y `updated_at`

### 📈 Índices

Optimizados para consultas comunes:
- Por usuario
- Por fecha
- Por categoría

## Consultas Útiles

### Ver próximos pagos de salario
```sql
select name, amount, next_payment_date
from income_sources
where user_id = auth.uid()
  and is_active = true
order by next_payment_date;
```

### Ver gastos fijos del mes
```sql
select description, amount, charge_day
from fixed_expenses
where user_id = auth.uid()
  and is_active = true
order by charge_day;
```

### Total de gastos fijos mensuales
```sql
select sum(amount) as total_fixed_expenses
from fixed_expenses
where user_id = auth.uid()
  and is_active = true;
```

### Ver período actual con presupuesto
```sql
select 
  start_date,
  end_date,
  initial_budget,
  carried_over,
  total_budget,
  spent,
  remaining
from budget_periods
where user_id = auth.uid()
  and current_date between start_date and end_date;
```

### Gastos variables del período actual
```sql
select 
  ve.description,
  ve.amount,
  ve.expense_date,
  c.name as category
from variable_expenses ve
left join expense_categories c on c.id = ve.category_id
where ve.user_id = auth.uid()
  and ve.expense_date >= (
    select start_date from budget_periods 
    where user_id = auth.uid() 
    and current_date between start_date and end_date
  )
order by ve.expense_date desc;
```

### Historial de períodos con balance
```sql
select 
  start_date,
  end_date,
  initial_budget,
  carried_over,
  spent,
  remaining,
  is_closed
from budget_periods
where user_id = auth.uid()
order by start_date desc
limit 6;
```
