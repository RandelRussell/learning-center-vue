import {createRouter, createWebHistory} from "vue-router";
import HomeComponent from "../public/pages/home.component.vue";
import AboutComponent from "../public/pages/about.component.vue";
import PageNotFoundComponent from "../public/pages/page-not-found.component.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/home', component: HomeComponent, meta: { title: 'Home' }, },
        { path: '/about', component: AboutComponent, meta: { title: 'About us' }, },
        { path: '/:pathMatch(.*)*', component: PageNotFoundComponent },
        { path: '/', redirect: '/home' }
    ]
});

router.beforeEach((to, from, next) => {
    let baseTitle = 'ACME Learning Center';
    document.title = `${ baseTitle } | ${to.meta["title"]}`;
    next();
});
export default router;