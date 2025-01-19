SELECT 
    CAST(
        (MIN(u.coins) + MAX(u.claimed_coins) + SUM(bh.quantity * bv.value)) 
        AS DECIMAL(32,18)
    ) AS accumulatedValue, 
    u.id AS userId 
FROM 
    beluga_holdings AS bh 
JOIN 
    beluga_variants AS bv ON bh.beluga_id = bv.id 
JOIN 
    users AS u ON bh.user_id = u.id 
GROUP BY 
    u.id;
