<!--
 +----------------------------------------------------------------------
 | @project   BenXinAdmin
 | @mission   应用根组件
 | @author    仗键天涯(daxing)
 | @email     3442535897@qq.com
 | @date      2026-06-08
 +----------------------------------------------------------------------
-->
<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('BenXinAdmin App Launch')
})
onShow(() => {
  console.log('BenXinAdmin App Show')
})
onHide(() => {
  console.log('BenXinAdmin App Hide')
})
</script>

<style lang="scss">
/* wot-design-uni 全局样式 */
@import 'wot-design-uni/components/common/abstracts/variable.scss';
</style>
