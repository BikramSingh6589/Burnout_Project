$f = 'd:\1. Biko folder\1. Development\7. Portfolios website\11. Burnout_Project\frontend\src\pages\Dashboard.tsx'
$c = Get-Content $f -Raw

$c = $c.Replace('border-slate-200/60 dark:border-[#334155]', 'border-border')
$c = $c.Replace('bg-white dark:bg-[#1E293B]', 'bg-surface')
$c = $c.Replace('text-neutral-slate dark:text-[#F8FAFC]', 'text-text-primary')
$c = $c.Replace('text-neutral-outline dark:text-[#CBD5E1]', 'text-text-secondary')
$c = $c.Replace('border-b border-slate-100/50 dark:border-[#334155]', 'border-b border-border')
$c = $c.Replace('dark:hover:shadow-xl', '')
$c = $c.Replace('hover:bg-slate-50 dark:hover:bg-[#273449]', 'hover:bg-surface-elevated')
$c = $c.Replace('bg-surface-low/30 dark:bg-[#111827]/30', 'bg-surface-elevated/30')
$c = $c.Replace('hover:border-primary/40 dark:hover:border-[#4F46E5]/40', 'hover:border-primary/40')
$c = $c.Replace('dark:border-[#4F46E5]', 'border-primary/40')
$c = $c.Replace('dark:text-[#F8FAFC]', '')
$c = $c.Replace('dark:text-[#4F46E5]', '')
$c = $c.Replace('dark:bg-primary', '')
$c = $c.Replace('dark:bg-[#4F46E5] dark:hover:bg-[#4338CA]', '')
$c = $c.Replace('dark:text-[#CBD5E1]', '')
$c = $c.Replace('text-neutral-slate/80', 'text-text-secondary')
$c = $c.Replace('text-neutral-slate', 'text-text-primary')
$c = $c.Replace('text-neutral-outline', 'text-text-secondary')

Set-Content $f $c
Write-Host "Done."
