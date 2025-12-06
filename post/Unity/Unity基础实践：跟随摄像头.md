## 实现功能
- 摄像头始终LookAt对象的某个位置偏移；
- 通过鼠标滚轮控制摄像头和对象距离的缩放，控制最大距离和最小距离；
- 通过SmoothDamp实现平滑镜头

## 变量声明
```Transform player```：指定跟随目标；如果是过程中生成，需要在Start中通过查找绑定。
``` float coefficient = 0.1f```：平滑系数，指定从当前位置平滑插值到目标位置的时间（秒）。
```float targetDistant = 5f```：指定摄像机和跟随目标之间的距离默认值。
```float eAngle=80f*Mathf.Deg2Rad```：指定旋转角，三角函数的计算需要使用**弧度制**。
```float distantMax = 8f```：设置摄像机和跟随目标的最大距离；
```float distantMin = 2f```：设置摄像机和跟随目标的最小距离；


```Vector3 currentVeloclty = new Vector3 (0, 0, 0)```：当前的平滑速度，由SmoothDamp函数进行管理，初始化为零向量即可。
```Vector3 currentCamera```：当前摄像机的位置（position)。
```Vector3 targetCamera```：目标摄像机位置（position）。
```Vector3 lookOffset=new Vector3(0,0.5f,0)```：LookAt相对跟随目标的坐标偏移。

## 初始化
接下来进入Start函数，其中的内容主要为各个变量的信息初始化。
1.初始化摄像机坐标。根据LookAt偏移和三角函数计算摄像机坐标的位置。
```
transform.position = player.position+lookOffset+new Vector3(0,
                                                            Mathf.Cos(eAngle) * targetDistant,
                                                            Mathf.Sin(eAngle) * targetDistant);
```
2.初始化currentCamera和targetCamera为摄像机当前坐标。
```
currentCamera = transform.position;
targetCamera = transform.position;
```
3.初始化摄像机旋转角。
此处使用面朝向量函数，传入一个方向向量（Vector3），返回对应的四元数，并将它赋给摄像机。
```
transform.rotation = Quaternion.LookRotation((player.position + lookOffset)-transform.position);
```

## 帧更新
初始化完成后，就要在运行中每帧都进行判定：
1.获取鼠标滚轮的输入，并赋值给targetDistant。
此处如果需要控制鼠标滚轮映射到distant的比例，可以额外定义一个浮点数作为系数乘算。
通过Mathf.Clamp()控制distant在指定范围内。
```
targetDistant += Input.mouseScrollDelta.y;
targetDistant= Mathf.Clamp(targetDistant, distantMin, distantMax);
```
2.根据targetDistant计算targetCamera坐标，同样用偏移+三角函数；
```
targetCamera = player.position+lookOffset+new Vector3(0,
                                                 Mathf.Cos(eAngle) * targetDistant,
                                                 Mathf.Sin(eAngle) * targetDistant);
```
3.使用SmoothDamp进行平滑插值。
```
currentCamera=Vector3.SmoothDamp(currentCamera, targetCamera, ref currentVeloclty,coefficient);
```
4.根据平滑插值的结果更新当前坐标。
```
transform.position = currentCamera;
```
5.更新摄像机旋转。
此处由于摄像机的旋转始终是相同的，可以省略。
```
transform.rotation = Quaternion.LookRotation((player.position + lookOffset) - transform.position);
```
需要注意一点：尽管摄像机的移动是在接收到鼠标滚轮的缩放后才发生的，但不能将以上内容包裹在if条件判断中。
这是因为当前帧更新targetDistant后SmoothDamp可能会持续运行数帧，如果使用条件判断则只会在当前帧插值，后续不会调用。

## Code
完整代码如下：
```
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Lesson2_21_CameraConsole : MonoBehaviour
{
    [SerializeField] Transform player;
    [SerializeField] float coefficient = 0.1f;     //平滑系数，指定从当前位置平滑插值到目标位置的时间（秒）
    float targetDistant = 5f;
    float eAngle=80f*Mathf.Deg2Rad;

    Vector3 currentVeloclty = new Vector3 (0, 0, 0);
    Vector3 currentCamera;
    Vector3 targetCamera;
    [SerializeField]Vector3 lookOffset=new Vector3(0,0.5f,0);

    [SerializeField]float distantMax = 8f;
    [SerializeField]float distantMin = 2f;


    void Start()
    {
        //初始化坐标，同步当前位置和目标位置
        //初始化角度
        transform.position = player.position+lookOffset+new Vector3(0,
                                                                    Mathf.Cos(eAngle) * targetDistant,
                                                                    Mathf.Sin(eAngle) * targetDistant);
        currentCamera = transform.position;
        targetCamera = transform.position;
        transform.rotation = Quaternion.LookRotation((player.position + lookOffset)-transform.position);
    }

    private void Update()
    {
        targetDistant += Input.mouseScrollDelta.y;
        targetDistant= Mathf.Clamp(targetDistant, distantMin, distantMax);

       //Update position and Distant.
        targetCamera = player.position+(new Vector3(0,
                                                         Mathf.Cos(eAngle) * targetDistant,
                                                         Mathf.Sin(eAngle) * targetDistant)+lookOffset);
        currentCamera=Vector3.SmoothDamp(currentCamera, targetCamera, ref currentVeloclty,coefficient);
        
        transform.position = currentCamera;
        transform.rotation = Quaternion.LookRotation((player.position + lookOffset) - transform.position);

#if UNITY_EDITOR
        Debug.DrawLine(player.position+(new Vector3(0,
                                                         Mathf.Cos(eAngle) * distantMin,
                                                         Mathf.Sin(eAngle) * distantMin)) + lookOffset, 
                       player.position+(new Vector3(0,
                                                         Mathf.Cos(eAngle) * distantMax,
                                                         Mathf.Sin(eAngle) * distantMax)) + lookOffset,
                       Color.red);
#endif
    }
}

```