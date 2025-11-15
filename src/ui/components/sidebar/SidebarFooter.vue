<template>
  <div class="sidebar-footer" :class="{ 'is-open': isOpen }">
    <div class="avatar-container">
      <Avatar
        v-if="user?.avatar"
        size="large"
        shape="circle"
        class="avatar-primary"
        :image="user?.avatar"
      />
      <Avatar
        v-else
        :label="firstTwoInitials(user?.firstName + ' ' + user?.lastName)"
        size="large"
        shape="circle"
        class="avatar-primary"
      />
    </div>
    <div class="user-info">
      <div class="user-name">{{ user?.firstName + ' ' + user?.lastName }}</div>
      <div class="user-mail">{{ user?.email }}</div>
    </div>
    <div class="icon-right">
      <ChevronsUpDown :size="14" />
    </div>
  </div>
</template>

<script lang="ts">
import Avatar from 'primevue/avatar';
import { computed, defineComponent } from 'vue';
import { ChevronsUpDown } from 'lucide-vue-next';

import { useUserStore } from '@/infrastructure/stores/user';
import { firstTwoInitials } from '@/ui/utils/strings';

export default defineComponent({
  name: 'SidebarFooter',
  components: {
    Avatar,
    ChevronsUpDown,
  },
  props: {
    isOpen: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup() {
    const userStore = useUserStore();
    const user = computed(() => userStore.user);

    return {
      user,
      firstTwoInitials,
    };
  },
});
</script>

<style lang="scss" scoped>
.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 14px;
  margin: 25px 5px;
  border-radius: 6px;
  overflow: hidden;
  box-sizing: border-box;
  min-height: 54px;
  background-color: transparent;
  cursor: pointer;
  user-select: none;
  &.is-open {
    background-color: #f1f5f9;
  }
  .avatar-container {
    margin-left: 2px;
    .avatar-primary {
      background-color: var(--p-primary-color);
      color: white;
    }
  }
  .user-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
    .user-name {
      font-size: 14px;
      font-weight: bold;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-mail {
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .icon-right {
    margin-right: 5px;
  }
}
</style>
