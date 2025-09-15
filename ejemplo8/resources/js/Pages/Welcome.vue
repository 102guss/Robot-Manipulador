<script setup>
import { Head, Link } from '@inertiajs/vue3';

defineProps({
    canLogin: {
        type: Boolean,
    },
    canRegister: {
        type: Boolean,
    },
    laravelVersion: {
        type: String,
        required: true,
    },
    phpVersion: {
        type: String,
        required: true,
    },
});

function handleImageError() {
    document.getElementById('screenshot-container')?.classList.add('!hidden');
    document.getElementById('docs-card')?.classList.add('!row-span-1');
    document.getElementById('docs-card-content')?.classList.add('!flex-row');
    document.getElementById('background')?.classList.add('!hidden');
}
</script>

<template>
    <Head title="Control de Brazo Robótico" />
    <div class="text-black/50 dark:text-white/50 relative" style="background-image: url('/models/cuautepec_4.jpg'); background-size: cover; background-position: center; background-repeat: no-repeat;">
        <div class="relative min-h-screen flex flex-col items-center justify-start pt-8 selection:bg-[#FF2D20] selection:text-white">
            <div class="relative w-full max-w-2xl px-6 lg:max-w-7xl">
                <header class="grid grid-cols-2 items-center gap-2 py-8 lg:grid-cols-3">
                    <div class="flex lg:justify-center lg:col-start-2">
                     
                    </div>
                    <nav v-if="canLogin" class="-mx-3 flex flex-1 justify-end">
                        <Link
                            v-if="$page.props.auth.user"
                            :href="route('dashboard')"
                            class="text-white hover:text-gray-200 px-3 py-2 text-sm font-medium underline-offset-4 hover:underline transition-colors duration-200"
                        >
                            Dashboard
                        </Link>

                        <template v-else>
                            <Link
                                :href="route('login')"
                                class="text-white hover:text-gray-200 px-3 py-2 text-lg font-medium underline-offset-4 hover:underline transition-colors duration-200"
                            >
                                Iniciar Sesión
                            </Link>

                            <Link
                                v-if="canRegister"
                                :href="route('register')"
                                class="text-white hover:text-gray-200 px-3 py-2 text-lg font-medium underline-offset-4 hover:underline transition-colors duration-200"
                            >
                                Registrarse
                            </Link>
                        </template>
                    </nav>
                </header>

                <main class="-mt-8">
                    <div class="grid gap-6 lg:grid-cols-2 lg:gap-8">
                        <a
                            
                            id="docs-card"
                            class="flex flex-col items-start gap-6 overflow-hidden rounded-lg bg-white/65 p-6 shadow-[0px_14px_34px_0px_rgba(0,0,0,0.08)] ring-1 ring-white/[0.05] transition duration-300 hover:text-black/70 hover:ring-black/20 focus:outline-none focus-visible:ring-[#FF2D20] md:row-span-3 lg:p-10 lg:pb-10 dark:bg-zinc-900/80 dark:ring-zinc-800 dark:hover:text-white/70 dark:hover:ring-zinc-700 dark:focus-visible:ring-[#FF2D20]"
                        >
                            <div id="screenshot-container" class="relative flex w-full flex-1 items-stretch">
                                
                               
                                <div
                                    class="absolute -bottom-16 -left-16 h-40 w-[calc(100%+8rem)] bg-gradient-to-b from-transparent   dark:via-zinc-900 dark:to-zinc-900"
                                ></div>
                            </div>

                            <div class="relative flex items-center gap-6 lg:items-end">
                                <div id="docs-card-content" class="flex items-start gap-6 lg:flex-col">
                                     <div class="pt-3 sm:pt-5">
                                <h2 class="text-3xl font-semibold text-black dark:text-white">Proyecto de Tesis</h2>

                                <p class="mt-4 text-2xl/relaxed font-bold">
                                  Gustavo Pozos Vázquez
                                  <br>
                                  Balam Lucio López
                                </p>
                            </div>
                                    <div class="pt-3 sm:pt-5 lg:pt-0">
                                        <h2 class="text-3xl font-semibold text-black dark:text-white">Sistema de Control Robótico</h2>
                                        <p class="mt-4 text-lg/relaxed font-bold">
                                            Plataforma web para el control y simulación de un brazo  robótico en tiempo real. Utiliza tecnología 3D  para la  visualización y control preciso de movimientos.
                                        </p>
                                    </div>
                                </div>  
                            </div>
                        </a>
                    </div>
                </main>  
            </div>
        </div>
    </div>
</template>
