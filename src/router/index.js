import { createRouter, createWebHistory } from 'vue-router';
import ChatView from '../views/ChatView.vue';
import ConversationsView from '../views/ConversationsView.vue';

const routes = [
  {
    path: '/',
    name: 'conversations',
    component: ConversationsView
  },
  {
    path: '/chat/:id',
    name: 'chat',
    component: ChatView,
    props: true
  },
  {
    path: '/chat/new',
    name: 'new-chat',
    component: ChatView
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
