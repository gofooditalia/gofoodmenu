<script lang="ts">
  // Qui useremo TypeScript se serve, per ora è vuoto
</script>

<div class="flex h-screen w-full flex-col items-center justify-center bg-slate-50 p-4">
  <div class="text-center space-y-6 max-w-md">
    
    <h1 class="text-4xl font-bold text-slate-900 tracking-tight">
      go!foodmenu
    </h1>
    <p class="text-slate-600">
      Il sistema operativo per il tuo ristorante.
      <br>Scegli dove vuoi andare:
    </p>

    <div class="grid gap-4 w-full">
      <a 
        href="/menu" 
        class="flex items-center justify-center w-full p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold shadow-lg transition-all transform hover:-translate-y-1"
      >
        🍕 Vai al Menu (Cliente)
      </a>

      <a 
        href="/dashboard" 
        class="flex items-center justify-center w-full p-4 bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-800 rounded-xl font-semibold transition-all"
      >
        👨‍🍳 Vai alla Dashboard (Admin)
      </a>
    </div>

  </div>
</div>